export enum BoxType {
    OTHER = 0, // '未知'
    SELL = 1, // '在售中',
    SOLD_OUT = 2, // '已售罄'
    NEW = 3, // 首发
    LACK = 4, // 缺货
    PRIVATE = 5 // 个人所有
}

export interface TBox {
    id: number;
    boxImg: string;
    status: BoxType;
    title: string;
    authorPic: string;
    authorName: string;
}

export type TBoxDetail = {
    id: number;
    boxImg: string;
    title: string;
    authorPic: string;
    authorName: string | '-';
    desc: string;
    sellLimit: number;
    onSale: number;
    price: number;
    priceUnit: string;
    onSaleTime: number;
};