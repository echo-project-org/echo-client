const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (process.platform === "win32" && process.getSystemVersion().startsWith("11")){
        //return transparent colors
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
        //if not windows 11 return solid colors
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }
}

export default hexToRgba;