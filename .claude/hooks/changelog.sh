#!/bin/bash
# Changelog hook - logs all tool actions to changelog.log
# Uses python (available on Windows) instead of jq for JSON parsing

INPUT=$(cat)
# Hardcode project dir to avoid issues when working directory differs
PROJECT_DIR="C:/Users/RohanChakraborty/source/repos/Claude-Tarining"
LOG_FILE="$PROJECT_DIR/changelog.log"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Parse JSON fields using python
get_field() {
  echo "$INPUT" | python -c "
import sys, json
try:
    data = json.load(sys.stdin)
    keys = '$1'.split('.')
    val = data
    for k in keys:
        if isinstance(val, dict):
            val = val.get(k, '')
        else:
            val = ''
            break
    print(val if val else '')
except:
    print('')
" 2>/dev/null
}

EVENT=$(get_field "hook_event_name")
TOOL=$(get_field "tool_name")

case "$EVENT" in
  PostToolUse)
    FILE_PATH=$(get_field "tool_input.file_path")
    COMMAND=$(get_field "tool_input.command")

    if [ "$TOOL" = "Edit" ]; then
      OLD=$(get_field "tool_input.old_string" | head -c 100)
      NEW=$(get_field "tool_input.new_string" | head -c 100)
      echo "[$TIMESTAMP] EDIT: $FILE_PATH" >> "$LOG_FILE"
      echo "  - Old: $OLD" >> "$LOG_FILE"
      echo "  + New: $NEW" >> "$LOG_FILE"
    elif [ "$TOOL" = "Write" ]; then
      echo "[$TIMESTAMP] WRITE: $FILE_PATH" >> "$LOG_FILE"
    elif [ "$TOOL" = "Bash" ]; then
      echo "[$TIMESTAMP] BASH: $COMMAND" >> "$LOG_FILE"
    else
      echo "[$TIMESTAMP] $TOOL: ${FILE_PATH:-done}" >> "$LOG_FILE"
    fi
    ;;
  PermissionRequest)
    FILE_PATH=$(get_field "tool_input.file_path")
    COMMAND=$(get_field "tool_input.command")
    echo "" >> "$LOG_FILE"
    echo "[$TIMESTAMP] PENDING APPROVAL: $TOOL -> ${FILE_PATH:-$COMMAND}" >> "$LOG_FILE"
    echo "  Waiting for user permission..." >> "$LOG_FILE"
    ;;
  Stop)
    echo "" >> "$LOG_FILE"
    echo "[$TIMESTAMP] TASK COMPLETED" >> "$LOG_FILE"
    echo "-------------------------------------------" >> "$LOG_FILE"
    ;;
esac

exit 0
