import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PKPass } from 'passkit-generator';
import {
  signerCert,
  signerKey,
  wwdr,
  icon,
  icon2x,
  icon3x,
  logo,
  logo2x,
} from './assets';

@Injectable()
export class PasskitService {
  getPass(
    eventId: ObjectId | string,
    eventName: string,
    eventDescription: string,
    startDate: Date,
    endDate: Date,
    userName: string,
  ): Buffer {
    const pass = new PKPass(
      {},
      {
        signerCert,
        signerKey,
        wwdr,
      },
      {
        formatVersion: 1,
        passTypeIdentifier: 'pass.net.club-rezo.rezaleux',
        serialNumber: `EVENTLY${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`,
        teamIdentifier: 'AY235446A3',
        organizationName: 'Evently',
        description: eventName,
      },
    );

    pass.type = 'eventTicket';

    pass.setRelevantDate(startDate);

    /* QR Code */
    pass.setBarcodes({
      message: `https://evently.docsystem.xyz/events/${eventId}`,
      format: 'PKBarcodeFormatQR',
    });

    /* Fields */
    pass.headerFields.push({
      key: 'header-date-time',
      label: 'Starting at',
      value: startDate,
      dateStyle: 'PKDateStyleShort',
      textAlignment: 'PKTextAlignmentRight',
    });

    pass.primaryFields.push({
      key: 'event-name',
      label: 'Event',
      value: eventName,
      textAlignment: 'PKTextAlignmentLeft',
    });

    pass.secondaryFields.push(
      {
        key: 'start-time',
        label: 'Starts at',
        value: startDate,
        timeStyle: 'PKDateStyleShort',
        textAlignment: 'PKTextAlignmentLeft',
      },
      {
        key: 'end-time',
        label: 'Ends at',
        value: endDate,
        timeStyle: 'PKDateStyleShort',
        textAlignment: 'PKTextAlignmentRight',
      },
    );

    pass.auxiliaryFields.push({
      key: 'event-participant',
      label: 'Participant',
      value: userName,
      textAlignment: 'PKTextAlignmentLeft',
    });

    pass.backFields.push({
      key: 'description',
      label: 'Description',
      value: eventDescription,
      textAlignment: 'PKTextAlignmentLeft',
    });

    /* Assets */
    pass.addBuffer('icon.png', icon);
    pass.addBuffer('icon@2x.png', icon2x);
    pass.addBuffer('icon@3x.png', icon3x);

    pass.addBuffer('logo.png', logo);
    pass.addBuffer('logo@2.png', logo2x);

    return pass.getAsBuffer();
  }
}
