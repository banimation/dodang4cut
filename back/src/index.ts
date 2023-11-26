import express from 'express'
import path from 'node:path'
import * as fs from 'node:fs'
import multer from 'multer'
import sharp from 'sharp'

const server = express()
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
        const selectedImg = req.body.selectedImg
        const width = 2000
        const height = 1500
        selectedImg.map(async (i: number) => {
            try {
                await sharp(`../public/picture/${selectedImg[i]}.png`)
                    .resize({width: width, height: height})
                    .toFile(`../public/composite/${selectedImg[i]}.png`)
            } catch (err) {
                console.log(err)
            }
            
        })
        const layers = selectedImg.map((i: number) => ({input: `../public/composite/${selectedImg[i]}.png`, left: 134, top: height * (i) + 80 * (i + 1)}))
        await sharp("../public/frame/frame.png")
            .composite(layers)
            .toFile("../public/result/result.png")
        for(let i = 0; i < 4; i++) {
            try {
                fs.unlinkSync(`../public/picture/${i}.png`)
                fs.unlinkSync(`../../front/public/picture/${i}.png`)
            } catch(err) {
                console.log(err)
            }
        }
        isconnect = false
        res.send("done")
    }
})

server.use(express.static(`${__dirname}/../../front/public`))

server.listen(80, () => {
    console.log("불빡")
})