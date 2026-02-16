$input_json = [Console]::In.ReadToEnd()
$LOG_FILE = "C:\Users\RohanChakraborty\source\repos\Claude-Tarining\changelog.log"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    $data = $input_json | ConvertFrom-Json
} catch {
    exit 0
}

$event = $data.hook_event_name
$tool = $data.tool_name

switch ($event) {
    "PostToolUse" {
        $filePath = $data.tool_input.file_path
        $command = $data.tool_input.command

        if ($tool -eq "Edit") {
            $old = if ($data.tool_input.old_string) { $data.tool_input.old_string.Substring(0, [Math]::Min(100, $data.tool_input.old_string.Length)) } else { "" }
            $new = if ($data.tool_input.new_string) { $data.tool_input.new_string.Substring(0, [Math]::Min(100, $data.tool_input.new_string.Length)) } else { "" }
            Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] EDIT: $filePath"
            Add-Content -Path $LOG_FILE -Value "  - Old: $old"
            Add-Content -Path $LOG_FILE -Value "  + New: $new"
        } elseif ($tool -eq "Write") {
            Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] WRITE: $filePath"
        } elseif ($tool -eq "Bash") {
            Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] BASH: $command"
        } else {
            $target = if ($filePath) { $filePath } else { "done" }
            Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] ${tool}: $target"
        }
    }
    "PermissionRequest" {
        $filePath = $data.tool_input.file_path
        $command = $data.tool_input.command
        $target = if ($filePath) { $filePath } else { $command }
        Add-Content -Path $LOG_FILE -Value ""
        Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] PENDING APPROVAL: $tool -> $target"
        Add-Content -Path $LOG_FILE -Value "  Waiting for user permission..."
    }
    "Stop" {
        Add-Content -Path $LOG_FILE -Value ""
        Add-Content -Path $LOG_FILE -Value "[$TIMESTAMP] TASK COMPLETED"
        Add-Content -Path $LOG_FILE -Value "-------------------------------------------"
    }
}

exit 0
