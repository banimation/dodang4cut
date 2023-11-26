const image = document.getElementById("img") as HTMLImageElement
const canvas = document.getElementById("canvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

fetch("getResult", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    }
}).then((res) => {
    // ctx.drawImage(res, 0, 0)
    console.log(res)
})