import {ActionsStrategy} from "./ActionsStrategy";
import path from "node:path";
import fs from "fs";

export default class ReminderStrategy implements ActionsStrategy {

    static instance: ReminderStrategy

    private constructor() {
        if (!ReminderStrategy.instance) {
            ReminderStrategy.instance = this
        }
        return ReminderStrategy.instance
    }

    static getInstance() {
        if (!ReminderStrategy.instance) {
            ReminderStrategy.instance = new ReminderStrategy()
        }
        return ReminderStrategy.instance
    }

    async active(reminder: string): Promise<void> {
        const filePath = path.join(__dirname, 'reminder.txt');
        fs.appendFile(filePath, `${new Date().toLocaleString()}: ${reminder}\n`, (err) => {
            if (err) {
                console.error('Error writing reminder:', err);
            } else {
                console.log('Reminder saved successfully!');
            }
        });
    }

}