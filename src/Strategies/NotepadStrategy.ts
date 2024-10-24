import {ActionsStrategy} from "./ActionsStrategy";
import path from "node:path";
import fs from "fs";
import {exec} from "node:child_process";

export default class NotepadStrategy implements ActionsStrategy {

    static instance: NotepadStrategy

    private constructor() {
        if (!NotepadStrategy.instance) {
            NotepadStrategy.instance = this
        }
        return NotepadStrategy.instance
    }

    static getInstance() {
        if (!NotepadStrategy.instance) {
            NotepadStrategy.instance = new NotepadStrategy()
        }
        return NotepadStrategy.instance
    }

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