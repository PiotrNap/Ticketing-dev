/// <reference types="qs" />
import { Request, Response, NextFunction } from "express";
export declare const errorHandler: (err: Error, req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>, res: Response<any>, next: NextFunction) => Response<any> | undefined;
