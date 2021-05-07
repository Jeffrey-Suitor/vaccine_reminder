# import pandas as pd
import os
from string import Template
import smtplib, ssl

# Config
phone = "705-522-9399"
hospital = "Martindale Animal Hospital"
hospital_email  = "jeffreysuitor117@gmail.com"
email_message_template = directory + "/email_message.txt"
missing_email_template = directory + "/missing_email.txt"
password = input("Type your password and press enter: ")



def read_template(filename):
    with open(filename, "r", encoding="utf-8") as template_file:
        template_file_content = template_file.read()
    return Template(template_file_content)


def update_email_body(template, pet, client, treatments_list, phone, hospital):
    treatments_string = ""
    for treatment in treatment_list:
        treatments_string = treatment + "\n"

    finished_message = template.substitute({
        "PET_NAME": pet_name,
        "CLIENT_NAME": client_name,
        "TREATMENTS": treatments,
        "PHONE_NUMBER": phone,
        "HOSPITAL": hospital
    })

    return finished_message


def send_email(hospital_email, password, client_email, message):
    port = 465  # For SSL
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
        server.login(hospital_email, password)
        server.sendmail(hospital_email, client_email, message)


def missing_email(template, client_name, pet_name, phone):
    finished_message = template.substitute({
        "CLIENT_NAME": client_name,
        "PET_NAME": pet_name,
        "PHONE_NUMBER": phone,
    })

    print(finished_message)

# Get the spreadsheets
directory = os.getcwd()
# client_list = pandas.read_excel(directory + "/client_list.xlsx")
# emails = pandas.read_excel(directory + "/client_emails.xlsx")

"""
original_template = read_template()
for client in client_list:
    if client.name = emails.name:
        email_body = update_email_body(email_message_template ...)
        send_email(hospital_email, password, client_email, email_body)
    else
        missing_email(missing_email_template, client.name, petemail)
"""
