const os = window.require('os');

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if(os.platform() === 'win32'  && os.release().startsWith('10.0.22')){
        //if windows 11
        return `rgb(${r}, ${g}, ${b}, ${alpha})`;
    } else {
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }
}

export default hexToRgba;