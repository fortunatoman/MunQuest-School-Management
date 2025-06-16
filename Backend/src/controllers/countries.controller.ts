import { Request, Response } from "express";
import { getCountriesService } from "../services/countries.service";

export const getCountries = async (req: Request, res: Response) => {
    try {
        const data = await getCountriesService();
        if (data.status === false) {
            return res.status(400).json({ success: false, message: data.message });
        } else {
            return res.status(200).json({ success: true, message: data.message, data: data.data });
        }
    } catch (error) {
        console.log('Error getting countries:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}