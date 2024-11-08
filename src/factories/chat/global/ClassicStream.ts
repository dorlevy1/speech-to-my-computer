import Stream from "../interfaces/Stream";
import Listener from "../../../utils/Listener";

export default class ClassicStream implements Stream {

    listener: Listener

    constructor() {
        console.log('stream activated in', this.constructor.name)
        this.listener = Listener.getInstance()
    }

    start(): void {
    }

    stop(): void {
    }
}