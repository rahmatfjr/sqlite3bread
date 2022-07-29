
const sqlite3 = require('sqlite3').verbose()
const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');



const db = new sqlite3.Database('challange.db', sqlite3.OPEN_READWRITE, err => {
    if (err) {
        console.log('gagal koneksi dengan database', err)
    }
})

const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {

    const url = req.url == '/' ? '/? pages = 1' : req.url
    console.log(url)

    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit
    const params = []
    

    db.all('SELECT COUNT(*) AS total FROM challange', (err, data) => {
        const pages = Math.ceil(data[0].total / limit)
        db.all('SELECT * FROM challange LIMIT ? OFFSET ?', [limit, offset], (err, data) => {
            if (err) {
                return console.log('ini error', err)
            }
            res.render('list', { rows: data, pages, page })

        })
    })
})

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    // console.log('ini add',req.body)
    db.all('insert into challange(String, Integers, Floats, Dates, Booleans) values (?, ?, ?, ?, ?)', [req.body.String, req.body.Integers, req.body.Floats, req.body.Dates, req.body.Booleans], (err) => {
        if (err) {
            console.log('ini error', err)
        }
        res.redirect('/')
    })
})

app.get('/edit/:id', (req, res) => {
    db.all('select * from challange where ID = ?', [req.params.id], (err, rows) => {
        if (err) {
            console.log('ini error', err)
        }
        res.render('edit', { rows })
    })
})

app.post('/edit/:id', (req, res) => {
    db.run('update challange set String = ?, Integers = ?, Floats = ?, Dates = ?, Booleans = ? Where ID = ?', [req.body.String, req.body.Integers, req.body.Floats, req.body.Dates, req.body.Booleans, req.body.ID], (err) => {
        if (err) {
            console.log('ini error', err)
        }
        res.redirect('/')
    })

})

app.get('/delete/:id', (req, res) => {
    db.run('DELETE FROM challange WHERE ID = ?', [req.params.id], (err) => {
        if (err) {
            console.log('ini error', err)
        }
        res.redirect('/')
    })
})

app.get('/search', (req, res) => {
    db.all('SELECT * FROM challange(ID = ?, String = ?, Iintegers = ?, Floats = ?, Dates = ?, Booleans = ?)', [req.body.ID, req.body.String, req.body.Integers, req.body.Floats, req.body.Dates, req.body.Booleans], (err) => {
        if (err) {
            console.log('ini error', err)
        }
        res.riderect('/')
    })
})

app.listen(port, () => {
    console.log(`example listening on ${port}`)
})