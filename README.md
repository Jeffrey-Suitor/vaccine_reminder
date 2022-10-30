# vaccine_reminder

This is a monorepo of two seperate projects.

## Goal

My dad's veterinary clinic still mails vaccine reminders by hand. This project was designed to automate that process. 

## Extracting the Data

Using the AViMark system querying features I was able to extract two spreadsheets containing client identifiers, emails, and what vaccine information is required for the reminders.

## CLI

After extracting the data I wrote a CLI program in python to send the automated email reminders. Essentially all they had to do was feed in the spreadsheet containing the combined data and then it would automatically send the emails. This was not ideal as the technologists wanted a user interface to send the data.

## Web

The web folder contains a firebase project that is incomplete for sending the vaccine reminder from an uploaded project. I'm not happy with the design of this as I've learnt more about web design since and will be reimplenting in the T3 stack.
