#!/usr/bin/env bash

# Default workspace path
if [[ -z "${WORKSPACE}" ]]; then
	export WORKSPACE=/workspace
fi


start_ssh_agent() {
	if [[ ! -z "$SSH_AUTH_SOCK" ]]; then
		if [[ "$(pgrep -i -c ssh-agent)" = "0" ]]; then
			# Launch a new instance of the agent
			ssh-agent -s &>${HOME}/.ssh/ssh-agent
		fi
		eval $(cat ${HOME}/.ssh/ssh-agent|grep -v echo)
	fi
}

# # Include scripts in /container-entrypoint.d directory
# if [[ -d /container-entrypoint.d ]]; then
# 	INCLUDES=($(find /container-entrypoint.d -type f -name "*.sh" | xargs))
# 	for INCLUDE in "${INCLUDES[@]}"; do
# 		. ${INCLUDE}
# 	done
# fi

# Default command option
OPT_COMMAND="start_ssh_agent"

eval set -- $(getopt -o c: --long command: -n 'entrypoint.sh' -- "$@")

while true; do
	case "$1" in
	-c | --command)
		OPT_COMMAND="$2"
		shift 2
		;;
	--)
		shift
		break
		;;
	esac
done

IFS=',' read -ra COMMAND <<<"${OPT_COMMAND}"
for METHOD in "${COMMAND[@]}"; do
	if declare -F "${METHOD}" >/dev/null; then
		"${METHOD}"
	fi
done

exec "$@"
