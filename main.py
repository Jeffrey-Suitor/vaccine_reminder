import pandas as pd
import os
from string import Template
import smtplib, ssl
import easygui

class reminderEmailer:

    def __init__(self, phone, hospital, hospital_email, subject_line):
        self.phone = phone
        self.hospital = hospital
        self.hospital_email = hospital_email
        self.subject_line = subject_line
        self.smtp_server = "smtp.gmail.com"
        self.port = 465

        reminder_msg = "Please select the reminders spreadsheet"
        email_msg = "Please select the client emails spreadsheet"
        email_body_msg = "Selected email_message.txt" 
        missing_email_msg = "Selected missing_email.txt"

        spreadsheet_err = "Not a spreadsheet file please try again." 
        txt_err = "Not a text file please try again." 

        spreadsheet_endings = ["xlsx", "xls"]
        txt_endings = ["txt"]

        # reminder_spread = os.getcwd() + "/test_reminders.xls"
        # email_spread = os.getcwd() + "/client_emails_real.xls"
        email_message_file = os.getcwd() + "/email_message.txt"
        missing_email_file = os.getcwd() + "/missing_email.txt"
        reminder_spread = None
        email_spread = None

        reminder_file = self.get_document(reminder_msg, spreadsheet_endings, spreadsheet_err, reminder_spread)
        self.reminder_df = self.get_reminder_df(reminder_file)

        email_file = self.get_document(email_msg, spreadsheet_endings, spreadsheet_err, email_spread)
        self.email_df = self.get_email_df(email_file)

        email_template = self.get_document(email_body_msg, txt_endings, txt_err, email_message_file)
        self.email_template = self.read_template(email_template)

        err_template = self.get_document(missing_email_msg, txt_endings, txt_endings, missing_email_file)
        self.err_template = self.read_template(err_template)

        self.password = self.get_password()

        self.clients = self.get_clients(self.reminder_df)

        for client in self.clients:
            self.match_client_emails(client, self.email_df)

    def get_reminder_df(self, reminder_file):
        reminder_df = pd.read_excel(
            reminder_file, 
            header=5, 
            usecols=["Name", 
                    "Phone No.", 
                    "Patient",
                    "Treatments/Items/Diagnoses Due", 
                    "Due Date"]
        )
        return reminder_df.rename(columns={
            "Treatments/Items/Diagnoses Due": "Treatments", 
            "Phone No.": "Phone"
        })


    def get_email_df(self, email_file):
        return pd.read_excel(
            email_file, 
            header=3, 
            usecols=["Full Name", "Text"]
        )


    def read_template(self, filename):
        with open(filename, "r", encoding="utf-8") as template_file:
            template_file_content = template_file.read()
        return Template(template_file_content)


    def update_email_body(self, pet_name, client_name, treatments):
        return self.email_template.substitute({
            "PET_NAME": pet_name.strip(),
            "CLIENT_NAME": client_name.strip(),
            "TREATMENTS": "\t" + treatments.strip(),
            "PHONE_NUMBER": self.phone.strip(),
            "HOSPITAL": self.hospital.strip()
        })


    def update_missing_email(self, client_name, pet_name, client_phone):
        return self.err_template.substitute({
            "CLIENT_NAME": client_name.strip(),
            "PET_NAME": pet_name.strip(),
            "PHONE_NUMBER": client_phone.strip(),
        })


    def send_email(self, client_email, message):
        context = ssl.create_default_context()
        return
        with smtplib.SMTP_SSL(self.smtp_server, self.port, context=context) as server:
            server.login(self.hospital_email, self.password)
            server.sendmail(self.hospital_email, client_email, self.subject_line + message)


    def get_clients(self, client_df):
        clients = []
        client = pd.Series([],dtype=pd.StringDtype())
        for label, row in client_df.iterrows():
            if pd.isna(row["Due Date"]):
                # If we have an empty due date we have switched clients
                if not client.empty:
                    clients.append(client)
                    client = pd.Series([],dtype=pd.StringDtype())
            else:
                if client.empty:
                    client = row
                    client_name = str(client["Name"]).strip()
                    client["First Name"] = client_name.split(",")[1].strip()
                    client["Last Name"] = client_name.split(",")[0].strip()
                else: 
                    client["Treatments"] = client["Treatments"] + "\n\t" + (row["Treatments"])


        return clients

    def match_client_emails(self, client, email_df):
        client_found = False
        for label, row in email_df.iterrows():
            if client["Name"].strip() == str(row["Full Name"]).strip():
                email_body = self.update_email_body(client["Patient"], client["First Name"] + " " + client["Last Name"], client["Treatments"] )
                client_found = True
                self.send_email(row["Text"], email_body)
                break

        if not client_found:
            print(self.update_missing_email(client["First Name"] + " " + client["Last Name"], client["Patient"], client["Phone"]))


    def get_document(self, sel_msg, file_endings, error_msg, doc_shortcut=None):
        print(sel_msg)
        while True:
            if (doc_shortcut):
                document_path = doc_shortcut
            else:
                document_path = easygui.fileopenbox()
            if any([ending in document_path for ending in file_endings]):
                break
            else:
                print(error_msg)

        return document_path

    
    def get_password(self):
        print("Please input your email password")
        password = input("Type your password and press enter: ") 
        print("\n")
        return password

    



if __name__ == "__main__":

    reminderEmailer(
        "705-522-9399", 
        "Martindale Animal Hospital", 
        "martindaleanimalhospital@gmail.com",
        "Subject: Martindale Animal Hospital - Reminder\n\n\n"
    )
