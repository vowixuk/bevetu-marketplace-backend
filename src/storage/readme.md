
Install essential package
npm install @aws-sdk/s3-request-presigner @aws-sdk/client-s3 @azure/storage-blob uuid



in .env

# --------- Storage Setting --------- #
# Choose storage "s3" or "azure"
STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=http://127.0.0.1:9000 

# Minio Storage Setting 
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=
STORAGE_REGION=us-east-1


# AWS S3 Bucket Storage Setting (AWS)
# STORAGE_ACCESS_KEY_ID=
# STORAGE_SECRET_ACCESS_KEY=
# STORAGE_REGION=eu-west-2
# STORAGE_ENDPOINT=
# STORAGE_S3_FORCE_PATH_STYLE=TRUE


# Storage Setting (Azure)
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=

# Storage Bucket / Blob example
BUCKET_USER_PROFILE_PICRURES=bevetu-user-profile-pictures-test
BUCKET_PET_PROFILE_PICRURES=bevetu-pet-profile-pictures-test
BUCKET_BLOOD_REPORT=bevetu-blood-report-test
