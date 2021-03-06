import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import * as Yup from 'yup'

import Orphanage from '../models/Orphanage'
import OrphanageView from '../views/orphanages_view'

export default {
  async index(req: Request, res: Response) {
    const orphanagesRepository = getRepository(Orphanage)

    const orphanages = await orphanagesRepository.find({
      relations: ['images']
    })

    return res.status(201).json(OrphanageView.renderMany(orphanages))
  },

  async create(req: Request, res: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = req.body

    const orphanagesRepository = getRepository(Orphanage)

    const resquestImages = req.files as Express.Multer.File[]
    const images = resquestImages.map(image => {
      return { path: image.filename }
    })

    const form = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
      images
    }

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required()
        })
      )
    })

    await schema.validate(form, {
      abortEarly: false
    })

    const orphanage = orphanagesRepository.create(form)

    await orphanagesRepository.save(orphanage)

    return res.status(201).json({ orphanage })
  },

  async show(req: Request, res: Response) {
    const { id } = req.params
    const orphanagesRepository = getRepository(Orphanage)

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ['images']
    })

    return res.json(OrphanageView.render(orphanage))
  }
}
