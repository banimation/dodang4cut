import express from 'express'
import path from 'node:path'
import * as fs from 'node:fs'
import multer from 'multer'

const server = express()
const upload = multer({
    storage: multer.diskStorage({
      	filename(_req, _file, done) {
            const filePath = path.join(__dirname, "../public")
            const number = (fs.readdirSync(filePath)).length
          	// console.log(file)
			done(null, `${number}.png`)
        },
		destination(_req, _file, done) {
		    done(null, path.join(__dirname, "../public"))
	    },
    }),
    // limits: { fileSize: 1024 * 1024 },
});
const uploadMiddleware = upload.single("picture")

server.use(express.urlencoded({ extended: false }), express.json(), uploadMiddleware)

server.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../front/public/html/index.html"))
})

server.post("/sendPicture", uploadMiddleware, (req, _res) => {
    console.log(req.file)
})

server.use(express.static(`${__dirname}/../../front/public`))

server.listen(80, () => {
    console.log("불빡")
})