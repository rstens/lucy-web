export const asyncFor = async (count: number, callback: any): Promise<any> =>  {
    if (typeof callback === 'function') {
        for (let i =0; i< count; i++) {
            await callback(i);
        }
    } else {
        return;
    }
};