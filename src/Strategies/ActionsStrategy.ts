export interface ActionsStrategy {

    active(data: any): Promise<void>
}