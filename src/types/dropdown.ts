import { Dropdown } from '../dropdown/dropdown';

export interface IDropdown extends Dropdown
{
    new(...constructorArgs: any[]): IDropdown
}