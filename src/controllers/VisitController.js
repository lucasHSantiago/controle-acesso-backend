const Visit = require('../models/Visit');
const User = require('../models/User');
const Mestre = require('../models/Mestre');

function dateVerifier(day, month, year) {
    if (day < 1 || day > 31)
        return false;

    if (month < 1 || month > 12)
        return false;

    if (year < 2020)
        return false;

    return true;
}

module.exports = {
    async store(req, res) {
        const { day, month, year, hourStart } = req.body;

        let today = new Date();

        if (day < today.getDate() || month < today.getMonth() + 1 || year < today.getFullYear())
            return res.status(400).send({ error: 'Não pode marcar horário para o dia anterior' });

        let mestre = await Mestre.findOne();

        if (hourStart < 1 || hourStart > 24 || hourStart < mestre.horarioInicialFuncionamento || hourStart > mestre.horarioFinalFuncionamento)
            return res.status(400).send({ error: 'Hora inválida' });

        if (!dateVerifier(day, month, year))
            return res.status(400).send({ error: 'Data inválid' });
        
        const { userId } = req
        let visit = await Visit.findOne({ day, month, year, hourStart });

        if (visit) {
            const found = visit.custumers.find(custumer => custumer.userId == userId);

            if (found)
                return res.status(409).send({ error: 'Você já tem visita nesse horário' });
        }
        
        let dayVisits = await Visit.find({ day, month, year });
        if (dayVisits) {
            let myVisits = [];

            dayVisits.map(visit => {
                const found = visit.custumers.find(custumer => custumer.userId == userId)

                if (found)
                    myVisits.push(found);
            });

            if (myVisits.length >= mestre.tempoPermanencia)
                return res.status(409).send({ error: 'Você já tem o limite de visitas para esse dia' });
        }

        let visitsDayBefore = await Visit.find({ day: Number.parseInt(day) - 1, hourEnd: { $gte: hourStart},  'custumers.0.userId': { $lte: userId } });
        if (visitsDayBefore.length)
            return res.status(400).send({ error: 'Você visitou em menos de 24 horas' });

        let user = await User.findOne({ _id: userId });
        if (!user)
            return res.status(400).send({ error: 'Usuário não existe' });
        
        if (visit) {
            if (visit.custumers.length >= mestre.maximoPessoas)
                return res.status(400).send({ error: 'Máximo de cliente para esse horário' });

            visit.custumers.push({ userId: req.userId, name: user.name });
            await visit.save();

            return res.json(visit);
        }

        const hourEnd = Number.parseInt(hourStart) + 1;

        visit = await Visit.create({ day, month, year, hourStart, hourEnd, custumers: [{ userId, name: user.name, email: user.email, cellPhone: user.cellPhone }] });

        return res.json(visit);
    },

    async index(req, res) {
        const visits = await Visit.find();

        return res.json(visits);
    },

    async show(req, res) {
        const _id = req.params.id;

        const visit = await Visit.findOne({ _id });

        if (!visit)
            return res.status(404).send({ error: 'Visita não encontrada' });

        return res.json(visit);
    },

    async showMonth(req, res) {
        const { month } = req.params;
        
        const visits = await Visit.find({ month }, ['day', 'hourStart', 'hourEnd', 'custumers'], {
            sort:{
                hourStart: 1
            }
        });

        let days = {};

        visits.map(visit => {
            let visitLocal       = {};
            visitLocal._id       = visit._id;   
            visitLocal.day       = visit.day;
            visitLocal.hourStart = visit.hourStart;
            visitLocal.hourEnd   = visit.hourEnd;
            visitLocal.custumers = visit.custumers;
            visitLocal.isMine    = false;

            if (visit.custumers.find(custumer => custumer.userId == req.userId))
                visitLocal.isMine = true;

            if (days[`${visit.day}`]) {
                days[`${visit.day}`].push(visitLocal);
            }
            else {
                days[`${visit.day}`] = [];
                days[`${visit.day}`].push(visitLocal);
            }
        });

        return res.json(days);
    },

    async showAvalibleHours(req, res) {
        let mestre = await Mestre.findOne();
        
        let horariosDisponiveis = {};
        for (let hora = mestre.horarioInicialFuncionamento; hora <= mestre.horarioFinalFuncionamento; ++hora)
            horariosDisponiveis[hora] = 0;

        const {day, month, year} = req.headers;
        let visitsDay = await Visit.find({ day, month, year });

        visitsDay.map(visit => {
            if (horariosDisponiveis[visit.hourStart] >= mestre.maximoPessoas || visit.custumers.find(customer => customer.userId == req.userId))
                delete horariosDisponiveis[visit.hourStart];
            else
                horariosDisponiveis[visit.hourStart]++;
        });

        return res.json(horariosDisponiveis);
    },

    async rescheduling(req, res) {
        const oldDateId = req.body.oldDateId;
        const newDate = req.body.new;
        
        let mestre = await Mestre.findOne()

        if (newDate.hourStart < 1 || newDate.hourStart > 24 || newDate.hourStart < mestre.horarioInicialFuncionamento || newDate.hourStart > mestre.horarioFinalFuncionamento)
            return res.status(400).send({ error: 'Nova hora inválida' });

        if (!dateVerifier(newDate.day, newDate.month, newDate.year))
            return res.status(400).send({ error: 'Nova data inválida' });

        let oldVisit = await Visit.findOne({ _id: oldDateId });
        if (!oldVisit) return res.status(404).send({ error: 'Visita não foi encontrada' });

        let user = await User.findById(req.userId);
        if (!user) return res.status(404).send({ error: 'Usuário não encontrado' });

        let newVisit = await Visit.findOne({ ...newDate });
        if (newVisit) {
            if (newVisit.custumers.length >= mestre.maximoPessoas)
                return res.status(409).send({ error: 'Máximo de cliente para esse horário' });

            const found = newVisit.custumers.find(customer => customer.userId == req.userId);
            if (found) return res.status(409).send({ error: 'Você já tem visita nesse horário' });

            newVisit.custumers.push({ userId: user._id, name: user.name, email: user.email, cellPhone: user.cellPhone });
            await newVisit.save();

            if (oldVisit.custumers.length == 1) {
                await Visit.deleteOne({ _id: oldVisit._id });

                return res.json(newVisit);
            }

            for (idxCustomer = 0; idxCustomer < oldVisit.custumers.length; idxCustomer++) {
                if (oldVisit.custumers[idxCustomer].userId == user._id) {
                    oldVisit.custumers.splice(idxCustomer, 1);

                    break;
                }
            }

            await oldVisit.save();

            return res.json(newVisit);
        } 

        oldVisit.day       = newDate.day;
        oldVisit.month     = newDate.month;
        oldVisit.year      = newDate.year;
        oldVisit.hourStart = newDate.hourStart;

        await oldVisit.save();

        return res.json(oldVisit);
    },

    async destroy(req, res) {
        const { id } = req.params;

        let visit = await Visit.findOne({ _id: id });
        if (!visit) return res.status(404).send({ error: 'Visit not found' });

        if (visit.custumers.length == 1) {
            await Visit.deleteOne({ _id: visit._id });

            return res.json();
        }

        for (idxCustomer = 0; idxCustomer < visit.custumers.length; idxCustomer++) {
            if (visit.custumers[idxCustomer].userId == req.userId) {
                visit.custumers.splice(idxCustomer, 1);

                break;
            }
        }

        await visit.save();

        return res.json();
    }
};