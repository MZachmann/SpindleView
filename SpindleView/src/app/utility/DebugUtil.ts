import { environment } from '../environments/environment';

export class DebugUtil {

    // print to console if in debug mode
    public static IfConsole(gulp: string) {
        if (!environment.production) {
            console.log(gulp);
        }
    }
}

