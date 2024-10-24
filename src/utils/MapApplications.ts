import fs, {PathLike} from "fs";
import path from "node:path";


const includeKeywords = [
    'GITHUB', 'GTA V', 'GOOGLE CHROME', 'LINKEDIN', 'POSTMAN', 'GIT', 'MONGO',
    'XBOX', 'DRAGON BALL', 'DS4', 'TWILIO', 'NOTEPAD', 'CALCULATOR', 'ROCKSTAR', 'STEAM'
];


export default class MapApplications {


    scanFolderRecursive(folderPath: PathLike): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let results: string[] = [];

            fs.readdir(folderPath, {withFileTypes: true}, (err, files) => {
                if (err) {
                    console.warn(`Unable to access folder ${folderPath}. Skipping...`);
                    return resolve(results); // אם יש שגיאה בגישה לתיקיה, נעבור הלאה
                }

                let pending = files.length;
                if (!pending) return resolve(results);

                files.forEach(file => {
                    const filePath = path.join(folderPath as string, file.name);

                    if (file.isDirectory()) {
                        // אם הקובץ הוא תיקיה, נבצע קריאה רקורסיבית על תיקיית המשנה
                        this.scanFolderRecursive(filePath).then(subFiles => {
                            results = results.concat(subFiles);
                            if (!--pending) resolve(results);
                        }).catch(reject);
                    } else if (file.isFile() && file.name.endsWith('.exe')) {
                        // אם הקובץ הוא קובץ הפעלה (.exe) ונכלל ברשימת המילים
                        if (includeKeywords.some(keyword => file.name.toUpperCase().includes(keyword))) {
                            results.push(filePath);
                        }
                        if (!--pending) resolve(results);
                    } else {
                        if (!--pending) resolve(results);
                    }
                });
            });
        });
    }

    // פונקציה למיפוי אפליקציות
    async mapApplications() {
        try {
            // סריקת Program Files ו-Program Files (x86)
            const programFiles = 'C:\\Program Files';
            const programFilesX86 = 'C:\\Program Files (x86)';

            // סריקת כל תיקיה רקורסיבית
            const appsInProgramFiles = await this.scanFolderRecursive(programFiles);
            const appsInProgramFilesX86 = await this.scanFolderRecursive(programFilesX86);

            // איחוד הרשימות
            const allApps = [...appsInProgramFiles, ...appsInProgramFilesX86];

            // הדפסת רשימת האפליקציות שנמצאו
            console.log('Apps found:', allApps);

            const outputPath = path.join(__dirname, 'apps.json');
            fs.writeFile(outputPath, JSON.stringify(allApps, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to JSON file:', err);
                } else {
                    console.log('Apps saved to apps.json successfully.');
                }
            });
        } catch (err) {
            console.error('Error occurred during mapping:', err);
        }
    }
}