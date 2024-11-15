import { Request, Response } from "express";
import { prismaclient } from "../..";

export const getProduct = async (_req: Request, res: Response) => {
    const data = await prismaclient.product.findMany(
        {
            where: {
                category_fk: 2
            }, 
            select: {
                name: true
            }
        }
    );
    res.json(data)
};


export const createProduct = async (req: Request, res: Response) => {
    
    const {name, categoryId} = req.body;

    await prismaclient.product.create({
        data: {
            name, 
            category_fk: categoryId
        }
    }).then((response)=> {
        res.json({message: 'All good', data: response})
    })

}
