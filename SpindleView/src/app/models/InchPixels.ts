   import { Units } from './smallclasses'
   
   export class InchPixels
    {
        public readonly InchPixelList : String[] = [ "Inches", "MM", "Pixels" ];

        public static InchToMM(ii : number) : number
        {
            return ii * 25.4;
        }

        public static MMtoInch(mm : number) : number
        {
            return mm / 25.4;
        }

        public UnitToString(unit : Units) : String
        {
            if (unit == Units.Inch)
            {
                return this.InchPixelList[0];
            }
            if (unit == Units.MM)
            {
                return this.InchPixelList[1];
            }
            return this.InchPixelList[2];
        }

        public static GetDrawUnits(name : string) : Units
        {
            switch (name)
            {
                case "Inches":
                    return Units.Inch;
                case "MM":
                    return Units.MM;
                case "Pixels":
                case "":
                    return Units.Pixel;
                default:
                    //throw new Exception("Unit of measure not found");
                    console.log("Unit of measure not found");
                    return Units.Inch;
            }
        }
    }

