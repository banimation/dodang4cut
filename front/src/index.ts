import mergeImages from "merge-images"
const main = document.getElementById("main") as HTMLElement
const cameraContainer = document.getElementById("camera-container") as HTMLElement
const cam = document.getElementById("cam") as HTMLVideoElement
const startBtn = document.getElementById("start-btn") as HTMLElement
const cursor = document.getElementById("cursor") as HTMLElement
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
const time = document.getElementById("time") as HTMLElement
const count = document.getElementById("count") as HTMLElement
const blackScreen = document.getElementById("black") as HTMLElement
const images = document.getElementById("images") as HTMLElement
const complete = document.getElementById("complete") as HTMLElement
const selectedImages = document.getElementById(`selected-images`)!
const selectContainer = document.getElementById("select-container")!
const black = document.getElementById("dark")!
const white = document.getElementById("white")!
let frameColor = "black"
black.addEventListener("click", () => {
    selectedImages.style.backgroundColor = "#000"
    frameColor = "black"
})
white.addEventListener("click", () => {
    selectedImages.style.backgroundColor = "#fff"
    frameColor = "white"
})

const maxCount = 6
const maxTime = 1
let currentCount = 0

const width = 1000
let height: number
let isStreaming = false

blackScreen.classList.add("hidden")

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
                setTimeout(async () => {
                    if(timeRemaining <= 0) {
                        time.innerText = ""
                        blackScreen.classList.remove("hidden")
                        await new Promise((res, _rej) => {
                            setTimeout(() => {
                                takePicture()
                                blackScreen.classList.add("hidden")
                                res("")
                            }, 1000)
                        })
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
const selectedImg: Array<number> = []
const updateSelectedImage = () => {
    selectedImages.replaceChildren()
    for(let i = 0; i < 4; i++) {
        if(selectedImg[i] !== undefined) {
            console.log("aaa")
            const img = document.createElement("img") as HTMLImageElement
            img.src = `/picture/${selectedImg[i]}.png`
            img.style.width = "90px"
            selectedImages.append(img)
        }
    }
}
startBtn.addEventListener('click', () => {
    main.classList.add("hidden")
    cameraContainer.classList.remove("hidden")
    perform().then(() => {
        time.innerText = "✔"
        setTimeout(() => {
            cameraContainer.classList.add("hidden")
            selectContainer.style.zIndex = "1"
            for(let i = 0; i < maxCount; i++) {
                const imgContainer = document.createElement("div")!
                const img = document.createElement("img") as HTMLImageElement

                imgContainer.classList.add("img-container")
                
                img.style.width = "200px"
                img.src = `/picture/${i}.png`
                img.classList.add("img")
                imgContainer.append(img)
                images.append(imgContainer)

                img.addEventListener("click", () => {
                    if(!(selectedImg.includes(i))) {
                        if(selectedImg.length < 4) {
                            selectedImg.push(i)
                            img.classList.add("selected")
                        }
                    } else {
                        const index = selectedImg.indexOf(i)
                        if (index > -1) {
                            selectedImg.splice(index, 1)
                            img.classList.remove("selected")
                        }
                    }
                    updateSelectedImage()
                })
            }
        }, 3000)
    })
})
complete.addEventListener("click", () => {
    if(selectedImg.length === 4) {
        fetch("createResult", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({selectedImg, frameColor})
        }).then((res) => {
            if(res) {
                // location.replace("/result")
                location.reload()
            }
        })
    }
})

window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`
    cursor.style.top = `${event.clientY}px`
})