# help
usage() {
    echo "Usage: $0 -d <local_directory> -r <remote_server> -p <remote_path> [-u <username>] [-i <identity_file>] [-e <file_extension>]"
    echo ""
    echo "Options:"
    echo "  -d  Local directory containing files to upload"
    echo "  -r  Remote server address (e.g., example.com or 192.168.1.100)"
    echo "  -p  Remote directory path where files will be uploaded"
    echo "  -u  SSH username (default: current user)"
    echo "  -i  SSH private key file (optional)"
    echo "  -e  Only upload files with this extension (optional, e.g., 'txt')"
    echo "  -h  Display this help message"
    exit 1
}

# Default values
USERNAME=$(whoami)
IDENTITY_FILE=""
FILE_EXTENSION=""

# Parse command line arguments
while getopts "d:r:p:u:i:e:h" opt; do
    case $opt in
        d) LOCAL_DIR=$OPTARG ;;
        r) REMOTE_SERVER=$OPTARG ;;
        p) REMOTE_PATH=$OPTARG ;;
        u) USERNAME=$OPTARG ;;
        i) IDENTITY_FILE="-i $OPTARG" ;;
        e) FILE_EXTENSION=$OPTARG ;;
        h) usage ;;
        *) usage ;;
    esac
done


if [ -z "$LOCAL_DIR" ] || [ -z "$REMOTE_SERVER" ] || [ -z "$REMOTE_PATH" ]; then
    echo "Error: Missing required parameters."
    usage
fi


if [ ! -d "$LOCAL_DIR" ]; then
    echo "Error: Local directory '$LOCAL_DIR' does not exist."
    exit 1
fi


if [ -z "$FILE_EXTENSION" ]; then
    FILE_PATTERN="*"
else
    FILE_PATTERN="*.$FILE_EXTENSION"
fi

file_count=$(find "$LOCAL_DIR" -type f -name "$FILE_PATTERN" | wc -l)
if [ "$file_count" -eq 0 ]; then
    echo "No matching files found in $LOCAL_DIR"
    exit 0
fi

echo "Found $file_count files to upload."

ssh $IDENTITY_FILE $USERNAME@$REMOTE_SERVER "mkdir -p $REMOTE_PATH"


echo "Starting file upload..."
uploaded=0
failed=0

for file in "$LOCAL_DIR"/$FILE_PATTERN; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Uploading: $filename"
        
        if scp $IDENTITY_FILE "$file" $USERNAME@$REMOTE_SERVER:"$REMOTE_PATH"; then
            echo "✓ Successfully uploaded: $filename"
            ((uploaded++))
        else
            echo "✗ Failed to upload: $filename"
            ((failed++))
        fi
    fi
done

echo "Upload complete!"
echo "Successfully uploaded: $uploaded files"
if [ $failed -gt 0 ]; then
    echo "Failed to upload: $failed files"
    exit 1
fi

exit 0