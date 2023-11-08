const main = document.getElementById("main") as HTMLElement

const cameraContainer = document.getElementById("camera-container") as HTMLElement
const cam = document.getElementById("cam") as HTMLVideoElement

const startBtn = document.getElementById("start-btn") as HTMLElement
const cursor = document.getElementById("cursor") as HTMLElement

const canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const time = document.getElementById("time") as HTMLElement
const count = document.getElementById("count") as HTMLElement

const maxCount = 6
const maxTime = 1
let currentCount = 0


const width = 1000
let height: number

let isStreaming = false

if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            cam.srcObject = stream
            cam.play()
        })
}

cam.addEventListener("canplay", () => {
    if(!isStreaming) {
        height = (cam.videoHeight / cam.videoWidth) * width;
        cam.setAttribute("width", String(width))
        cam.setAttribute("height", String(height))
        canvas.setAttribute("width", String(width))
        canvas.setAttribute("height", String(height))
        count.innerText = `${currentCount}/${maxCount}`
        isStreaming = true
    }
})

const takePicture = () => {
    ctx.drawImage(cam, 0, 0, width, height)
    canvas.toBlob((blob) => {
        if(blob) {
            const formData = new FormData()
            formData.append("picture", blob)
            console.log(blob)
            fetch(`/sendPicture`, {
                method: "POST",
                headers: {
                    "Content_Type" : "multipart/form-data"
                },
                body: formData
            })
        }
    })
}

const perform = async () => {
    let timeRemaining = maxTime
    for(let i = 0; i < maxCount; i++) {
        for(let n = 0; n < maxTime + 1; n++) {
            await new Promise((res, _rej) => {
                setTimeout(() => {
                    if(timeRemaining <= 0) {
                        time.innerText = ""
                        takePicture()
                        currentCount += 1
                        count.innerText = `${currentCount}/${maxCount}`
                        timeRemaining = maxTime
                    } else {
                        time.innerText = String(timeRemaining)
                        timeRemaining -= 1
                    }
                    res(" ")
                }, 1000)
            })
        }
    }
    
}

startBtn.addEventListener('click', () => {
    main.classList.add("hidden")
    cameraContainer.classList.remove("hidden")
    perform()
})
window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`
    cursor.style.top = `${event.clientY}px`
})