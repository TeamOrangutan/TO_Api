import { Request, Response } from "express";
import { prismaclient } from "../..";

export const getProduct = async (_req: Request, res: Response) => {
    const data = await prismaclient.producto.findMany(
        {
            where: {
                producto_pk: 2
            }, 
            select: {
                nombre: true
            }
        }
    );
    res.json(data)
};


/* export const createProduct = async (req: Request, res: Response) => {
    
    const {name, categoryId} = req.body;

    await prismaclient.producto.create({
        data: {
            name, 
            category_fk: categoryId
        }
    }).then((response)=> {
        res.json({message: 'All good', data: response})
    })

} */
