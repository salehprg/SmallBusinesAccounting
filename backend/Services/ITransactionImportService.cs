using backend.Models.DTO;

namespace backend.Services;

public interface ITransactionImportService
{
    Task<BulkTransactionPreviewResponseDTO> PreviewAsync(Stream excelStream, string? fileName);

    Task<BulkTransactionImportResultDTO> CommitAsync(BulkTransactionImportRequestDTO request);
}
