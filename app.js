const express = require("express");
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require("mongodb");

const app = express();

app.use(express.json());

let db;

// Veritabanına bağlanma
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log("Uygulama 3000. portta çalışıyor");
        });
        db = getDb();
    } else {
        console.error("Veritabanına bağlanılamadı:", err);
    }
});

// Tüm kitapları listeleme
app.get('/api', (req, res) => {
    let kitaplar = [];

    const sayfa = req.query.s || 0

    const sayfaVeriAdet=3

    db.collection('kitaplar')
        .find()
        .skip(sayfa*sayfaVeriAdet)//kaçıncı veriden başlayacağımızı belirtir
        .limit(sayfaVeriAdet)
        .forEach(kitap => kitaplar.push(kitap))
        .then(() => {
            res.status(200).json(kitaplar);
        })
        .catch(() => {
            res.status(500).json({ hata: "Verilere erişilemedi" });
        });
});

// Veri ekleme
app.post('/api', (req, res) => {
    const kitap = req.body;

    db.collection('kitaplar')
        .insertOne(kitap)
        .then(sonuc => {
            res.status(201).json(sonuc);
        })
        .catch(err => {
            res.status(500).json({ hata: "Veri eklenemedi" });
        });
});

// Veri silme
app.delete('/api/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection("kitaplar")
            .deleteOne({ _id: new ObjectId(req.params.id) }) // 'new' eklendi
            .then(sonuc => {
                if (sonuc.deletedCount === 0) {
                    res.status(404).json({ hata: "Veri bulunamadı" });
                } else {
                    res.status(200).json({ mesaj: "Veri başarıyla silindi" });
                }
            })
            .catch(err => {
                res.status(500).json({ hata: "Veri silinemedi" });
            });
    } else {
        res.status(400).json({ hata: "Geçersiz ID formatı" }); // 500 yerine 400 hata kodu
    }
});

// Veri bulma
app.get('/api/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db.collection("kitaplar")
            .findOne({ _id: new ObjectId(req.params.id) }) // 'new' eklendi
            .then(sonuc => {
                if (sonuc) {
                    res.status(200).json(sonuc);
                } else {
                    res.status(404).json({ hata: "Veri bulunamadı" });
                }
            })
            .catch(err => {
                res.status(500).json({ hata: "Veriye erişilemedi" });
            });
    } else {
        res.status(400).json({ hata: "Geçersiz ID formatı" });
    }
});


//veri güncelleme
app.patch('/api/:id',(req,res)=>{
    const guncellenecekVeri=req.body;

    if (ObjectId.isValid(req.params.id)) {
        db.collection("kitaplar")
            .updateOne({ _id: new ObjectId(req.params.id)},{$set:guncellenecekVeri}) // 'new' eklendi
            .then(sonuc => {
                res.status(200).json(sonuc)
            })
            .catch(err => {
                res.status(500).json({ hata: "Veri güncellenemedi" });
            });
    } else {
        res.status(400).json({ hata: "Geçersiz ID formatı" });
    }
})

