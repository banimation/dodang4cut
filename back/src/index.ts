import express, { json } from 'express'
import path from 'node:path'
import * as fs from 'node:fs'
import multer from 'multer'

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
	    },
    }),
    // limits: { fileSize: 1024 * 1024 },
}).single("picture")

server.use(express.urlencoded({ extended: false, limit:"5mb" }), express.json({ limit:"5mb" }), Upload)

server.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../front/public/html/index.html"))
})

server.post("/sendPicture", Upload, (_req, res) => {
    res.send("done")
})

server.post("/createResult", (req, res) => {
    const b64:string = (req.body.b64).split(",")[1]
    fs.writeFileSync("../result/result.png", b64, {encoding: "base64"})
    res.send("done")
})

server.use(express.static(`${__dirname}/../../front/public`))

server.listen(80, () => {
    console.log("불빡")
})