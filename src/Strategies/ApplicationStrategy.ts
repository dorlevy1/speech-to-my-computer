import {ActionsStrategy} from "./ActionsStrategy";
import apps from "../structure";
import {AppStructure} from "@ctypes/appStructure";
import {exec} from "node:child_process";
import ReminderStrategy from "./ReminderStrategy";

export default class ApplicationStrategy implements ActionsStrategy {

    private reminderStrategy: ReminderStrategy

    constructor() {
        this.reminderStrategy = ReminderStrategy.getInstance()
    }

    async active(response: string): Promise<void> {
        const appNames = Object.keys(apps) as (keyof AppStructure)[]; // שימוש ב-keyof
        const foundApp: keyof AppStructure | undefined = appNames.find(app => response.toLowerCase().includes((app as string).toLowerCase()));

        if (foundApp) {
            const app = apps[foundApp];
            this.openApplication(app.command);
        } else if (response.toLowerCase().includes('create reminder')) {
            const note = response.split('create reminder ')[1]; // ניתוח התזכורת
            await this.reminderStrategy.active(note)
        } else {
            console.log('Unknown command or unsupported action.');
        }
    }

    openApplication(appName: string) {
        exec(appName, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening ${appName}:`, error);
                return;
            }
            console.log(`${appName} opened successfully!`);
        });
    }

}