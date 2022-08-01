require('dotenv').config()

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

    // const {StringC} = req.query

    const url = req.url == '/' ? '/?page=1' : req.url
    console.log(url)

    const page = req.query.page || 1
    const limit = 2
    const offset = (page - 1) * limit
    const wheres = []
    const value = []


    if (req.query.ID && req.query.ids == 'on') {
        wheres.push(`ID = ?`)
        value.push(req.query.ID)
    }

    if (req.query.String  && req.query.strng == 'on') {
        wheres.push(`String like '%' || ? || '%'`)
        value.push(req.query.String)
    }

    if (req.query.Integers && req.query.int == 'on') {
        wheres.push(`Integers = ?`)
        value.push(req.query.Integers)
    }

    if (req.query.Floats && req.query.flo == 'on') {
        wheres.push(`Floats = ?`)
        value.push(req.query.Floats)
    }

    if (req.query.dt == 'on') {
        if (req.query.Start_Dates && req.query.End_Dates) {
            wheres.push(`Dates between ? and ?`)
            value.push(req.query.Start_Dates)
            value.push(req.query.End_Dates)
        }
    }
    if (req.query.Booleans  && req.query.blo == 'on') {
        wheres.push(`Booleans = ?`)
        value.push(req.query.Booleans)
        console.log(req.query.Booleans)
    }



    let sql = 'SELECT COUNT(*) AS total FROM challange'
    if (wheres.length > 0) {
        sql += ` WHERE ${wheres.join(' and ')}`
    }
    console.log('ssql count ', sql)

    db.all(sql, value, (err, data) => {
        const pages = Math.ceil(data[0].total / limit)

        sql = 'SELECT * FROM challange'
        if (wheres.length > 0) {
            sql += ` WHERE ${wheres.join(' and ')}`
        }

        sql += ' LIMIT ? OFFSET ?'

        console.log('sql get', sql)

        db.all(sql, [...value, limit, offset], (err, data) => {
            if (err) {
                return console.log('ini error', err)
            }
            res.render('list', { rows: data, pages, page, url, req })

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

// app.get('/search', (req, res) => {
//     db.all('SELECT * FROM challange(ID = ?, String = ?, Iintegers = ?, Floats = ?, Dates = ?, Booleans = ?)', [req.body.ID, req.body.String, req.body.Integers, req.body.Floats, req.body.Dates, req.body.Booleans], (err) => {
//         if (err) {
//             console.log('ini error', err)
//         }
//         res.riderect('/')
//     })
// })

app.listen(port, () => {
    console.log(`example listening on ${port}`)
})