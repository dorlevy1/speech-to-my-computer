import {ipcRenderer} from "electron";

window.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadButton') as HTMLButtonElement;
    const loader = document.getElementById('loader') as HTMLDivElement;

    const minimizeButton = document.getElementById('minimize') as HTMLElement;
    const maximizeButton = document.getElementById('maximize') as HTMLElement;
    const closeButton = document.getElementById('close') as HTMLElement;

    minimizeButton.addEventListener('click', () => {
        ipcRenderer.send('window-minimize');
    });

    maximizeButton.addEventListener('click', () => {
        ipcRenderer.send('window-maximize');
    });

    closeButton.addEventListener('click', () => {
        ipcRenderer.send('window-close');
    });

    uploadButton.addEventListener('click', () => {
        loader.style.display = 'block';

        // Simulate file upload with a delay
        setTimeout(() => {
            loader.style.display = 'none';
            alert('File uploaded successfully!');
        }, 3000);
    });
});

window.addEventListener('keypress', (event) => {
    if (event.key.toLowerCase() === 's') {
        ipcRenderer.send('start-recording');
    }
});

window.addEventListener('keypress', (event) => {
    if (event.key.toLowerCase() === 'b') {
        ipcRenderer.send('stop-recording'); // שולח פקודה לתהליך הראשי להפסיק את ההקלטה
    }
})


const showNotification = () => {
    new Notification('Speak to my computer!', {
        badge: 'Speak to my computer by Dor Levy',
        body: 'מילת הקסם היא "מלך"',
        icon: 'src/assets/images/icon.ico'  // לא חובה
    });
}
//
// // תוכל לקרוא לפונקציה הזו כאשר אתה רוצה להציג את ההתראה
// setTimeout(() => {
//     showNotification();
// }, 3000)