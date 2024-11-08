export default function Logger(message?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        //target - class name
        //propertyKey - function name
        //descriptor.value - the function himself

        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            console.log(`[${ propertyKey }: ${ message }]`,args);
            // קריאה למתודה המקורית ושמירה על התוצאה שלה
            const result = originalMethod.apply(this, args);
            // // אם התוצאה היא הבטחה (Promise), נוסיף לוגים נוספים כשמתקבל הפלט הסופי
            // if (result instanceof Promise) {
            //     result
            //         .then((res) => {
            //             console.log(`Result of ${ propertyKey }:`, res);
            //         })
            //         .catch((err) => {
            //             console.error(`Error in ${ propertyKey }:`, err);
            //         });
            // } else {
            //     console.log(`Result of ${ propertyKey }:`, result);
            // }

            return result;
        };
    }
}