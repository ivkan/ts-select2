import { Results } from '../results';

export interface IResults extends Results
{
    new(...constructorArgs: any[]): IResults
}