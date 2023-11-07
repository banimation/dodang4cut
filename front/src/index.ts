const main = document.getElementById("main") as HTMLElement

const camera = document.getElementById("camera") as HTMLElement
const cam = document.getElementById("cam") as HTMLVideoElement

const startBtn = document.getElementById("start-btn") as HTMLElement
const cursor = document.getElementById("cursor") as HTMLElement

const canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const countText = document.getElementById("count") as HTMLElement

const width = window.innerWidth
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

startBtn.addEventListener('click', () => {
    main.classList.add("hidden")
    camera.classList.remove("hidden")
    let count = 3
    const interval = setInterval(() => {
        if(count <= 0) {
            countText.innerText = ""
            takePicture()
            clearInterval(interval)
        } else {
            countText.innerText = String(count)
            count -= 1
        }
    }, 1000)
})
window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`
    cursor.style.top = `${event.clientY}px`
})