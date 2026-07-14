interface FileInfoProps {
    fileName: string;
    imageWidth: number;
    imageHeight: number;
}

export const FileInfo: React.FC<FileInfoProps> = ({
    fileName,
    imageHeight,
    imageWidth,
}) => {
    return (
        <div className="flex justify-between text-xs font-light text-zinc-200">
            <span>{fileName}</span>
            <span>
                {imageWidth}x{imageHeight}
            </span>
        </div>
    );
};
