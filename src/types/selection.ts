import { BaseSelection } from '../selection/base';

export interface ISelection extends BaseSelection
{
    new(...constructorArgs: any[]): ISelection

    selectionContainer(): HTMLSpanElement;
    display(data, container?): string;
    clear(): void;
}