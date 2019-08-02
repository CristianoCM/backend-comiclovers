import fs from 'fs';
import path from 'path';
import Book from '../models/Book';
import Illustrator from '../models/Illustrator';
import Writer from '../models/Writer';
import Publisher from '../models/Publisher';
import Licensor from '../models/Licensor';

const loadJson = async () => {
  const file = await fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'config', 'books.json')
  );
  return JSON.parse(file);
};

class BulkInsertController {
  async bulkStore(req, res) {
    const books = await loadJson();

    try {
      const result = books.map(async data => {
        const book = await Book.create(data);

        const bookIllustrators = await data.illustrators.map(
          async illustrator => {
            const [resultIllustrator] = await Illustrator.findOrCreate({
              where: { name: illustrator.name },
              defaults: { name: illustrator.name },
            });
            return resultIllustrator.id;
          }
        );

        book.addIllustrators(await Promise.all(bookIllustrators));

        const bookWriters = await data.writers.map(async writer => {
          const [resultWriter] = await Writer.findOrCreate({
            where: { name: writer.name },
            defaults: { name: writer.name },
          });
          return resultWriter.id;
        });

        book.addWriters(await Promise.all(bookWriters));

        const bookPublishers = await data.publishers.map(async publisher => {
          const [resultPublisher] = await Publisher.findOrCreate({
            where: { name: publisher.name },
            defaults: { name: publisher.name },
          });
          return resultPublisher.id;
        });

        book.addPublishers(await Promise.all(bookPublishers));

        const bookLicensors = await data.licensors.map(async licensor => {
          const [resultLicensor] = await Licensor.findOrCreate({
            where: { name: licensor.name },
            defaults: { name: licensor.name },
          });
          return resultLicensor.id;
        });

        const resultLicensors = await Promise.all(bookLicensors);
        console.log(resultLicensors);
        book.addLicensors(resultLicensors);
      });

      // const booksPromises = books.map(data => {
      //   return Book.create(data, {
      //     // include: [
      //     //   {
      //     //     model: Illustrator,
      //     //     as: 'illustrators',
      //     //   },
      //     //   {
      //     //     model: Publisher,
      //     //     as: 'publishers',
      //     //   },
      //     //   {
      //     //     model: Writer,
      //     //     as: 'writers',
      //     //   },
      //     //   {
      //     //     model: Licensor,
      //     //     as: 'licensors',
      //     //   },
      //     // ],
      //   });
      // });

      // const result = await Promise.all(booksPromises);
      return res.status(201).json(result);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Problem with bulk creation' });
    }
  }
}

export default new BulkInsertController();
