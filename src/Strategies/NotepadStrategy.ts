import {ActionsStrategy} from "./ActionsStrategy";
import fs from "fs";
import {exec} from "node:child_process";

export default class NotepadStrategy implements ActionsStrategy {

    async active(content: string): Promise<void> {
        const filePath = 'note.txt';
        fs.writeFileSync(filePath, content || '', 'utf8');

        exec(`notepad ${filePath}`, (error) => {
            if (error) {
                console.error('Error opening Notepad:', error);
            }
        });
    }

}