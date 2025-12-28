import { Children, isValidElement, ReactElement, ReactNode } from "react"

export interface FileNode {
  id: string           // Full path as unique ID
  name: string
  type: "file" | "folder"
  url?: string
  size?: number
  date?: string
  fileType?: string
  depth: number        // For indentation
  children?: FileNode[]
  defaultOpen?: boolean
}

interface FileProps {
  name: string
  url?: string
  size?: number
  date?: string
  type?: string
}

interface FolderProps {
  name: string
  children?: ReactNode
  defaultOpen?: boolean | string
  date?: string
  size?: number
}

/**
 * Transforms React children (declarative MDX structure) into a flat array of FileNode objects.
 * This allows TanStack Table to handle the data with its built-in features.
 */
export function transformChildrenToData(
  nodes: ReactNode,
  parentPath: string = "",
  depth: number = 0
): FileNode[] {
  const result: FileNode[] = []

  Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return

    const element = child as ReactElement<FileProps | FolderProps>
    const { name } = element.props
    if (!name) return

    const fullPath = parentPath ? `${parentPath}/${name}` : name

    // Check if it's a folder (has children prop that contains more nodes)
    const children = (element.props as FolderProps).children
    const isFolder = children !== undefined

    if (isFolder) {
      const folderProps = element.props as FolderProps
      const childNodes = transformChildrenToData(children, fullPath, depth + 1)
      
      result.push({
        id: fullPath,
        name,
        type: "folder",
        depth,
        date: folderProps.date,
        size: folderProps.size,
        defaultOpen: folderProps.defaultOpen === true || folderProps.defaultOpen === "true",
        children: childNodes.length > 0 ? childNodes : undefined,
      })
    } else {
      const fileProps = element.props as FileProps
      result.push({
        id: fullPath,
        name,
        type: "file",
        url: fileProps.url,
        size: fileProps.size,
        date: fileProps.date,
        fileType: fileProps.type,
        depth,
      })
    }
  })

  return result
}

/**
 * Flattens the hierarchical FileNode tree into a single array for selection operations.
 */
export function flattenNodes(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  
  function traverse(items: FileNode[]) {
    for (const node of items) {
      result.push(node)
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return result
}

/**
 * Gets all file nodes (non-folders) from the tree.
 */
export function getFileNodes(nodes: FileNode[]): FileNode[] {
  return flattenNodes(nodes).filter(node => node.type === "file" && node.url)
}

/**
 * Gets all descendant IDs of a node (for batch selection).
 */
export function getDescendantIds(node: FileNode): string[] {
  const ids: string[] = []
  
  function traverse(items: FileNode[] | undefined) {
    if (!items) return
    for (const item of items) {
      ids.push(item.id)
      traverse(item.children)
    }
  }
  
  traverse(node.children)
  return ids
}

