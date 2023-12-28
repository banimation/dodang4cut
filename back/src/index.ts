import express, { response } from 'express'
import path from 'node:path'
import * as fs from 'node:fs'
import multer from 'multer'
import sharp from 'sharp'
import * as ssl from 'ssl-root-cas'
import * as https from "node:https"

const server = express()
const rootCas = ssl.create()
https.globalAgent.options.ca = rootCas

https.createServer({key: fs.readFileSync("../ssl/classhelper.kro.kr-key.pem"), cert: fs.readFileSync("../ssl/classhelper.kro.kr-crt.pem")}, server)
  .listen(443)
server.use(express.urlencoded({ extended: false }), express.json())

let resultCounts = 0

const Upload = multer({
    storage: multer.diskStorage({
      	filename(_req, _file, done) {
            const filePath = path.join(__dirname, "../../front/public/picture")
            const number = (fs.readdirSync(filePath)).length
          	// console.log(file)
			done(null, `${number}.png`)
        },
		destination(_req, _file, done) {
		    done(null, path.join(__dirname, "../../front/public/picture"))
            done(null, path.join(__dirname, "../public/picture"))
	    },
    }),
    // limits: { fileSize: 1024 * 1024 },
}).single("picture")

server.use(express.urlencoded({ extended: false, limit:"5mb" }), express.json({ limit:"5mb" }), Upload)

server.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../front/public/html/index.html"))
})

server.get("/result", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../front/public/html/result.html"))
})

server.post("/sendPicture", Upload, (_req, res) => {
    res.send("done")
})

server.post("getResult", (_req, res) => {
    res.sendFile(path.join(__dirname, "../public/result/result.png"))
})
let isconnect = false
server.post("/createResult", async (req, res) => {
    if(!isconnect) {
        isconnect = true
        const selectedImg: Array<number> = req.body.selectedImg
        const frameColor = req.body.frameColor
        const width = 2000
        const height = 1500
        console.log(selectedImg)
        await new Promise(async (res) => {
            const arr = selectedImg.map(async (i: number, index: number) => {
                await new Promise(async (resolve) => {
                    try {
                        console.log(selectedImg)
                        await sharp(`../public/picture/${i}.png`)
                            .resize({width: width, height: height})
                            .toFile(`../public/composite/${index}.png`)
                        resolve("")
                    } catch (err) {
                        console.log(err)
                    }
                })
            })
            await Promise.allSettled(arr).then(() => {
                res("")
            })
        }).then(async () => {
            const layers = []
            for(let i = 0; i < 4; i++) {
                layers.push({input: `../public/composite/${i}.png`, left: 134, top: height * (i) + 80 * (i + 1)})
            }
            await sharp(`../public/frame/${frameColor}.png`)
                .composite(layers)
                .toFile(`../public/result/result-${resultCounts}.png`)
            for(let i = 0; i < 6; i++) {
                try {
                    fs.unlinkSync(`../public/picture/${i}.png`)
                    fs.unlinkSync(`../../front/public/picture/${i}.png`)
                } catch(err) {
                    console.log(err)
                }
            }
            for(let i = 0; i < 4; i++) {
                try {
                    fs.unlinkSync(`../public/composite/${i}.png`)
                } catch(err) {
                    console.log(err)
                }
            }
            isconnect = false
            resultCounts += 1
            res.send("done")
        })
    }
})

server.use(express.static(`${__dirname}/../../front/public`))

server.listen(80, () => {
    console.log("불빡")
})