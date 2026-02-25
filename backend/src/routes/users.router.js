import { Router } from "express";

const router = Router()

router.get('/', (req,res) => {
    // res.render('index', {title: 'index' ,name: 'Gustavo', estilo: 'style1'})
    res.render('index', {title: 'index' ,name: 'Gustavo'})
})

export default router