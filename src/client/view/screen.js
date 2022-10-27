export const resizeCanvas = (canvas, pixelshown, scaleToInteger = true) => {

    const screen = { w: window.innerWidth, h: window.innerHeight }
    const mult = Math.min(screen.w / pixelshown.w, screen.h / pixelshown.h)

    let rmult
    if ((mult >= 1) && scaleToInteger) {
        rmult = Math.floor(mult)
    } else {
        rmult = mult
    }

    canvas.width = pixelshown.w
    canvas.height = pixelshown.h

    canvas.style.width = `${pixelshown.w * rmult}px`
    canvas.style.height = `${pixelshown.h * rmult}px`

}
