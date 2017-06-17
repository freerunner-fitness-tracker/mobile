export const unixTime = () => {
    return Math.ceil(+Date.now() / 1000);
};

export const getTime = (unixTime: number) => {
    const date = new Date(unixTime * 1000);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`;
    const seconds = `0${date.getSeconds()}`;

    return `${hours}:${minutes.substr(-2)}`;
};

export const getDate = (unixTime: number) => {
    const date = new Date(unixTime * 1000);
    const day = `0${date.getDate()}`;
    const month = `0${date.getMonth() + 1}`;
    const year = date.getFullYear();

    return `${year}-${month.substr(-2)}-${day.substr(-2)}`;
};

export const padLeft = (string: string | number, pad: string, length: number): string => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
};