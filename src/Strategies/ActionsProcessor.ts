import {ActionsStrategy} from "./ActionsStrategy";

export default class ActionsProcessor {

    private action: ActionsStrategy;

    constructor(actionStrategy: ActionsStrategy) {
        this.action = actionStrategy
    }

    process(data: any) {
        return this.action.active(data)
    }
}