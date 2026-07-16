import { BadRequestException } from "@nestjs/common";

export function parseBigInt(value: string, fieldName: string): bigint {
    try {
        return BigInt(value);
    } catch (error) {
        throw new BadRequestException(`Некорректный формат ${fieldName}. Ожидалось число.`);
    }
}